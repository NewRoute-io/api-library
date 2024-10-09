export class ResponseError extends Error {
  status: number;
  name: string;

  constructor(name: string, message: string, status: number) {
    super(message);
    this.name = name;
    this.status = status;
  }
}
