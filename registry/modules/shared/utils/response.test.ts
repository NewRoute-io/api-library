import { describe, it, expect, vi, beforeEach } from "vitest";

import { notFoundError } from "./errors/common.js";
import { response } from "./response.js";

describe("Response Object Tests", () => {
  it("should return data object", () => {
    const mockData = {
      mock: "test",
    };

    const mockResponse = response(mockData);

    expect(mockResponse.data).toBeTruthy();
    expect(mockResponse.error).toBeFalsy();
    expect(mockResponse.data).toEqual(mockData);
  });

  it("should return empty response if data is undefined", () => {
    const mockResponse = response();

    expect(mockResponse.data).toBeFalsy();
    expect(mockResponse.error).toBeFalsy();
  });

  it("should return error object and no data", () => {
    const error = notFoundError();
    const mockResponse = response(undefined, error);

    expect(mockResponse.data).toBeFalsy();
    expect(mockResponse.error).toBeTruthy();
    expect(mockResponse.error).toEqual({
      name: error.name,
      message: error.message,
    });
  });
});
