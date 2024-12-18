import { describe, beforeEach, it, vi, Mock, expect } from "vitest";
import {
  ScheduledTaskRepository,
  Task,
} from "@/repositories/scheduledTask.interface.js";
import { TaskRegistry } from "./taskRegistry.js";
import { TaskProcessorService } from "./taskProcessorService.js";
import { NoRetryPolicy } from "./taskRetryPolicy/noRetryPolicy.js";
import { ExponentialBackoffRetryPolicy } from "./taskRetryPolicy/exponentialBackoffRetryPOlicy.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("TaskProcessor", () => {
  let taskProcessorService: TaskProcessorService;
  let mockScheduledTaskRepository: ScheduledTaskRepository;
  let mockRegistry: TaskRegistry;
  let processingBatchSize: number;
  let pollInterval: number;

  beforeEach(() => {
    vi.resetAllMocks();
    processingBatchSize = 10;
    pollInterval = 1000;

    mockScheduledTaskRepository = {
      saveTask: vi.fn(),
      submitTasks: vi.fn(() => []),
      updateTask: vi.fn(),
    } as unknown as ScheduledTaskRepository;
    mockRegistry = {
      register: vi.fn(),
      get: vi.fn(),
    } as unknown as TaskRegistry;

    taskProcessorService = new TaskProcessorService(
      mockScheduledTaskRepository,
      mockRegistry,
      processingBatchSize,
      pollInterval
    );
  });

  it("processes tasks", async () => {
    const exampleProcessor = vi.fn();
    const example1Processor = vi.fn();
    const example2Processor = vi.fn();

    const task1 = {
      id: 1,
      type: "example",
      payload: {},
      status: "SUBMITTED",
      retries: 0,
      version: 1,
      runAfter: new Date(),
    } as Task;

    const task2 = {
      id: 2,
      type: "example1",
      payload: {},
      status: "SUBMITTED",
      retries: 0,
      version: 1,
      runAfter: new Date(),
    } as Task;

    const task3 = {
      id: 3,
      type: "example2",
      payload: {},
      status: "SUBMITTED",
      retries: 0,
      version: 1,
      runAfter: new Date(),
    } as Task;

    (mockScheduledTaskRepository.updateTask as Mock)
      .mockImplementation((task: Task) => {
        return {
          ...task,
          version: task.version + 1,
        } as Task;
      })(mockRegistry.get as Mock)
      .mockImplementation((type: string) => {
        switch (type) {
          case "example":
            return { processor: exampleProcessor };
          case "example1":
            return { processor: example1Processor };
          case "example2":
            return { processor: example2Processor };
        }

        throw Error(type);
      });
    (mockScheduledTaskRepository.submitTasks as Mock)
      .mockReturnValueOnce([])
      .mockReturnValueOnce([task1, task2])
      .mockReturnValueOnce([])
      .mockReturnValueOnce([task3])
      .mockReturnValueOnce([]);

    await sleep(5000);

    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(expect.objectContaining({
      type: task1.type,
      version: 1,
      status: "PROCESSING",
    }));
    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(expect.objectContaining({
      type: task2.type,
      version: 1,
      status: "PROCESSING",
    }));
    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(expect.objectContaining({
      type: task3.type,
      version: 1,
      status: "PROCESSING",
    }));

    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(expect.objectContaining({
      type: task1.type,
      version: 2,
      status: "DONE",
    }));
    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(expect.objectContaining({
      type: task2.type,
      version: 2,
      status: "DONE",
    }));
    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(expect.objectContaining({
      type: task3.type,
      version: 2,
      status: "DONE",
    }));

    expect(exampleProcessor).toHaveBeenCalledOnce();
    expect(example1Processor).toHaveBeenCalledOnce();
    expect(example2Processor).toHaveBeenCalledOnce();
  }, 10000);

  it("failed task with NoRetryPolicy gets ERROR status", async () => {
    const exampleProcessor = vi.fn(() => {
      throw new Error();
    });

    const task1 = {
      id: 1,
      type: "example",
      payload: {},
      status: "SUBMITTED",
      retries: 0,
      version: 1,
      runAfter: new Date(),
    } as Task;

    (mockScheduledTaskRepository.updateTask as Mock)
      .mockImplementation((task: Task) => {
        return {
          ...task,
          version: task.version + 1,
        } as Task;
      })(mockRegistry.get as Mock)
      .mockImplementation((type: string) => {
        switch (type) {
          case "example":
            return {
              processor: exampleProcessor,
              retryPolicy: new NoRetryPolicy(),
            };
        }

        throw Error(type);
      });
    (mockScheduledTaskRepository.submitTasks as Mock)
      .mockReturnValueOnce([task1])
      .mockReturnValue([]);

    await sleep(2000);

    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        type: "example",
        payload: {},
        status: "PROCESSING",
        retries: 0,
        version: 1,
      })
    );

    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        type: "example",
        payload: {},
        status: "ERROR",
        retries: 1,
        version: 2,
      })
    );

    expect(exampleProcessor).toHaveBeenCalledOnce();
  }, 10000);

  it("failed task with ExponentialBackoffRetryPolicy gets WAITING status", async () => {
    const exampleProcessor = vi.fn(() => {
      throw new Error();
    });

    const task1 = {
      id: 1,
      type: "example",
      payload: {},
      status: "SUBMITTED",
      retries: 0,
      version: 1,
      runAfter: new Date(),
    } as Task;

    let updateTaskArgCaptor: Task | null = null;

    (mockScheduledTaskRepository.updateTask as Mock)
      .mockImplementation((task: Task) => {
        updateTaskArgCaptor = task;
        return {
          ...task,
          version: task.version + 1,
        } as Task;
      })(mockRegistry.get as Mock)
      .mockImplementation((type: string) => {
        switch (type) {
          case "example":
            return {
              processor: exampleProcessor,
              retryPolicy: new ExponentialBackoffRetryPolicy(
                2000,
                2,
                10,
                10000
              ),
            };
        }

        throw Error(type);
      });
    (mockScheduledTaskRepository.submitTasks as Mock)
      .mockReturnValueOnce([task1])
      .mockReturnValue([]);

    await sleep(2000);

    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        type: "example",
        payload: {},
        status: "PROCESSING",
        retries: 0,
        version: 1,
      })
    );

    expect(mockScheduledTaskRepository.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        type: "example",
        payload: {},
        status: "WAITING",
        retries: 1,
        version: 2,
      })
    );

    console.log(updateTaskArgCaptor)
    expect(
      (updateTaskArgCaptor as unknown as Task).nextRetryTime?.getTime()
    ).toBeGreaterThan(
      new Date(task1?.runAfter?.getTime() ?? 0 + 1999).getTime()
    );
    expect(
      (updateTaskArgCaptor as unknown as Task).nextRetryTime?.getTime()
    ).toBeLessThan(new Date(new Date().getTime() + 4000).getTime());

    expect(exampleProcessor).toHaveBeenCalledOnce();
  }, 10000);
});
