import * as fs from 'fs-extra';

const testHarness = (config: string, schema: string, schemaType = 'json', expectErr = false) => {
  fs.writeFileSync('.app-config.toml', config);
  fs.writeFileSync(`.app-config.schema.${schemaType}`, schema);
  let result;
  if (expectErr) {
    expect(() => require('./index').validate()).toThrow();
  } else {
    result = require('./index').validate();
  }
  fs.removeSync('.app-config.toml');
  fs.removeSync(`.app-config.schema.${schemaType}`);
  return result;
};

describe('config', () => {
  beforeAll(() => {
    process.chdir('/tmp');
  });

  test('loads json schema', () => {
    testHarness(`
      firstName = "John"
      lastName = "Doe"
      age = 33
    `,          `
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Person",
        "type": "object",
        "required": [ "firstName", "lastName", "age" ],
        "properties": {
          "firstName": {
            "type": "string",
            "description": "The person's first name."
          },
          "lastName": {
            "type": "string",
            "description": "The person's last name."
          },
          "age": {
            "description": "Age in years which must be equal to or greater than zero.",
            "type": "integer",
            "minimum": 0
          }
        }
      }
    `);
  });

  test('loads toml schema', () => {
    testHarness('', '', 'toml');
  });

  test('rejects invalid toml schema', () => {
    testHarness(`
      firstName = "John"
      age = 33
    `,          `
      "$schema" = "http://json-schema.org/draft-07/schema#"
      title = "Person"
      type = "object"
      required = [ "firstName", "lastName", "age" ]

      [properties.firstName]
      type = "string"
      description = "The person's first name."

      [properties.lastName]
      type = "string"
      description = "The person's last name."

      [properties.age]
      description = "Age in years which must be equal to or greater than zero."
      type = "integer"
      minimum = 0
    `,          'toml', true);
  });

  test('loads secrets', () => {
    fs.writeFileSync('.app-config.secrets.toml', `
      password = "passw0rd"
    `);
    const config = testHarness(`
      email = "jon@example.com"
    `,                         `
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "required": [ "email", "password" ],
        "properties": {
          "email": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        }
      }
    `);
    expect(config).toEqual({ email: 'jon@example.com', password: 'passw0rd' });

    fs.removeSync('.app-config.secrets.toml');
  });
});
