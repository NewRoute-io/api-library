import { describe, beforeEach, it, vi, expect } from "vitest";
import { TaskProcessorService } from "./taskProcessorService.js";
import { createScheduledTaskRepository } from "@/repositories/scheduledTask.postgres.js";
import { TaskRegistry } from "./taskRegistry.js";
import { ScheduledTaskRepository } from "@/repositories/scheduledTask.interface.js";
import { TaskScheduler } from "./taskScheduler.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe.only("TaskScheduler", () => {
  let scheduledTaskRepository: ScheduledTaskRepository;
  let taskRegistry: TaskRegistry;
  let taskProcessorService: TaskProcessorService;
  let taskScheduler: TaskScheduler;

  beforeEach(() => {
    TaskRegistry.destroy()
    scheduledTaskRepository = createScheduledTaskRepository();
    taskRegistry = new TaskRegistry();
    taskProcessorService = new TaskProcessorService(
      scheduledTaskRepository,
      taskRegistry,
      10,
      1000
    );
    taskScheduler = new TaskScheduler(
      scheduledTaskRepository,
      taskRegistry,
      taskProcessorService
    );
  });

  it("task executes immediately", async () => {
    const processor = vi.fn();
    taskRegistry.register("example", processor);
    const payload = { test: Math.floor(Math.random() * 100) };
    const task = await taskScheduler.scheduleTask("example", payload);

    await sleep(1050);

    expect(processor).toHaveBeenCalledWith(expect.objectContaining(payload));

    const finalTask = await scheduledTaskRepository.getTaskById(task.id!)

    const timeBetweenCreateAndExecute = (finalTask?.updatedAt?.getTime()??0) - (finalTask?.createdAt?.getTime()??0)
    expect(timeBetweenCreateAndExecute).toBeLessThan(2000)
  });

  it("task executes in 5 seconds", async () => {
    const processor = vi.fn();
    taskRegistry.register("example", processor);
    const payload = { test: Math.floor(Math.random() * 100) };
    const task = await taskScheduler.scheduleTask(
      "example",
      payload,
      new Date(new Date().getTime() + 5000)
    );

    await sleep(4000);

    expect(processor).not.toHaveBeenCalled();

    await sleep(2050);
    expect(processor).toHaveBeenCalledWith(expect.objectContaining(payload));

    const finalTask = await scheduledTaskRepository.getTaskById(task.id!)

    const timeBetweenCreateAndExecute = (finalTask?.updatedAt?.getTime()??0) - (finalTask?.createdAt?.getTime()??0)
    expect(timeBetweenCreateAndExecute).toBeGreaterThan(5000)
    expect(timeBetweenCreateAndExecute).toBeLessThan(7000)
  }, 10000);
});
