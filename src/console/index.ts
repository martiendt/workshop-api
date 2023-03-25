import { URL } from "url";
import { ExpressCli } from "@point-hub/express-cli";

export class ConsoleKernel {
  public path = new URL(".", import.meta.url).pathname;
  private command: ExpressCli;

  constructor(command: ExpressCli) {
    this.command = command;
  }

  /**
   * Register the commands for the application.
   *
   * @example
   * command.register(new ExampleCommand());
   */
  async register() {
    const { default: Command1 } = await import("./commands/db-seed/index.command.js");
    const { default: Command2 } = await import("./commands/db-init/index.command.js");
    this.command.register(new Command1());
    this.command.register(new Command2());
  }
}
