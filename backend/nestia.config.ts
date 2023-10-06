import { INestiaConfig } from '@nestia/sdk';

export const NESTIA_CONFIG: INestiaConfig = {
  /**
   * Building `swagger.json` is also possible.
   *
   * If not specified, you can't build the `swagger.json`.
   */

  swagger: {
    /**
     * Output path of the `swagger.json`.
     *
     * If you've configured only directory, the file name would be the `swagger.json`.
     * Otherwise you've configured the full path with file name and extension, the
     * `swagger.json` file would be renamed to it.
     */
    output: 'swagger.json',
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Local server',
      },
    ],
    security: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },

  /**
   * List of files or directories containing the NestJS controller classes.
   */
  input: 'src/**/*.controller.ts',

  /**
   * Output directory that SDK would be placed in.
   *
   * If not configured, you can't build the SDK library.
   */
  output: '../packages/sdk',

  /**
   * Target directory that SDK distribution files would be placed in.
   *
   * If you configure this property and runs `npx nestia sdk` command,
   * distribution environments for the SDK library would be generated.
   *
   * After the SDK library generation, move to the `distribute` directory,
   * and runs `npm publish` command, then you can share SDK library with
   * other client (frontend) developers.
   */
  // distribute: "packages/api",

  /**
   * Allow simulation mode.
   *
   * If you configure this property to be `true`, the SDK library would be contain
   * simulation mode. In the simulation mode, the SDK library would not communicate
   * with the real backend server, but just returns random mock-up data
   * with requestion data validation.
   *
   * For reference, random mock-up data would be generated by `typia.random<T>()`
   * function.
   *
   * @default false
   */
  // simulate: true,
  propagate: true,
  distribute: '../packages/sdk',
};
export default NESTIA_CONFIG;
