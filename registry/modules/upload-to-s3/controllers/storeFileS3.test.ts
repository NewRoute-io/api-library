import { describe, it, expect, vi, beforeEach } from "vitest";
import { sdkStreamMixin } from "@smithy/util-stream";
import { mockClient } from "aws-sdk-client-mock";

import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

import { createStoreFileS3Controller } from "@/modules/upload-to-s3/controllers/storeFileS3.js";
import {
  errorDownloadingS3File,
  cantGetS3Files,
} from "@/modules/upload-to-s3/utils/errors/storeFileS3.js";

const s3Mock = mockClient(S3Client);

vi.mock("formidable", () => {
  const mockImplementation = {
    on: vi.fn(),
    parse: vi.fn(),
  };

  return {
    default: vi.fn(() => mockImplementation),
  };
});

vi.mock("@aws-sdk/lib-storage", () => ({
  Upload: vi.fn().mockImplementation(() => ({
    done: vi.fn().mockResolvedValue({
      Location: "https://s3.amazonaws.com/bucket/test-file.txt",
    }),
  })),
}));

describe("upload-to-s3 API Module Tests", () => {
  describe("StoreFileS3 Controller Tests", () => {
    const s3Client = new S3Client({});
    let controller: ReturnType<typeof createStoreFileS3Controller>;

    const mockFileName = "test-file.txt";
    const mockFile = {
      originalFilename: mockFileName,
      filepath: "/path/to/test-file.txt",
      mimetype: "text/plain",
      content: Buffer.from([8, 6, 7, 5, 3, 0, 9]),
    };

    beforeEach(() => {
      s3Mock.reset();

      // Injecting the mocked repository into the controller
      controller = createStoreFileS3Controller(s3Client);
    });

    /**
     *
     * NOTE: Testing streamed files seems to be tricky, left the implementation commented out for now
     *       we should discuss if its worth testing at all
     *
     */

    // describe("Upload file tests", () => {
    //   const mockReq: any = {};
    //   let mockForm: ReturnType<typeof formidable>;
    //   let listeners: Record<string, Function>;

    //   beforeEach(() => {
    //     listeners = {};
    //     mockForm = formidable({ allowEmptyFiles: false });

    //     // Mock the 'on' method to register event listeners
    //     (mockForm.on as Mock).mockImplementation((event, callback) => {
    //       listeners[event] = callback;
    //     });
    //   });

    //   it("should successfully upload a file to S3", async () => {
    //     const result = await controller.uploadFile({
    //       req: mockReq,
    //       fileName: mockFileName,
    //     });
    //     expect(result).toEqual({
    //       s3Location: `https://s3.amazonaws.com/bucket/${mockFileName}`,
    //     });

    //     expect(mockForm.parse).toHaveBeenCalledWith(mockReq);
    //   });

    //   it("should handle file parsing errors when streaming a file to S3", async () => {
    //     const mockErrorCode = "MockError";

    //     (mockForm.parse as Mock).mockImplementation((_) => {
    //       listeners["error"]({ code: mockErrorCode });
    //     });

    //     await expect(controller.uploadFile(mockReq)).rejects.toThrowError(
    //       fileUploadFailed(mockErrorCode)
    //     );
    //   });
    // });

    it("should download a file from S3", async () => {
      const stream = new Readable();
      stream.push(mockFile.content);
      stream.push(null);
      const sdkStream = sdkStreamMixin(stream);

      s3Mock
        .on(GetObjectCommand)
        .resolves({ Body: sdkStream, ContentType: mockFile.mimetype });

      const result = await controller.downloadFile({ fileName: mockFileName });
      const bodyStr = await result.Body?.transformToString();

      expect(result.ContentType).toBe(mockFile.mimetype);
      expect(bodyStr).toBe(mockFile.content.toString());
    });

    it("should throw errorDownloadingS3File if downloading fails", async () => {
      s3Mock.on(GetObjectCommand).rejects();

      await expect(
        controller.downloadFile({ fileName: mockFileName })
      ).rejects.toThrowError(errorDownloadingS3File(mockFileName));
    });

    it("should get a list of files in S3", async () => {
      const ContinuationToken = "1";
      const NextContinuationToken = "2";
      const mockContent = {
        name: mockFileName,
        size: 1024,
        modified: new Date(),
      };

      s3Mock.on(ListObjectsV2Command).resolves({
        Contents: [
          {
            Key: mockContent.name,
            Size: mockContent.size,
            LastModified: mockContent.modified,
          },
        ],
        ContinuationToken,
        NextContinuationToken,
      });

      const result = await controller.getFileList({
        pageToken: ContinuationToken,
      });

      expect(result.files).toContainEqual(mockContent);
      expect(result.nextToken).toBe(NextContinuationToken);
    });

    it("should throw cantGetS3Files if S3 can't list files in bucket", async () => {
      s3Mock.on(ListObjectsV2Command).rejects();

      await expect(controller.getFileList({})).rejects.toThrowError(
        cantGetS3Files()
      );
    });

    it("should delete a file from S3", async () => {
      const filesToDelete = [mockFileName];
      s3Mock.on(DeleteObjectsCommand).resolves({});

      expect(controller.deleteFiles({ files: filesToDelete })).toBeTruthy();
    });
  });
});
