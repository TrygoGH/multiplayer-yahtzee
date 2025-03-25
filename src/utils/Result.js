class Result {
  constructor(success, data = undefined, message = "") {
    this.success = success;
    this.data = data;
    this.message = message;
  }
}

export default Result;
