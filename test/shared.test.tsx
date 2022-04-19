import {
  clearEmptyObjectValues,
  createDefaultFromSchema,
  resolveReference,
} from '../src/utils/shared';

const testObj1 = {
  aws_access_key: {},
  aws_bucket_name_or_arn: 's',
  aws_delete_after_read: false,
  aws_ignore_body: true,
  aws_region: 's',
  aws_secret_key: {},
  data_shape: {
    produces: {
      format: 'application/octet-stream',
    },
  },
  error_handler: {
    stop: {},
  },
  kafka_topic: 's',
};

const testSchema1 = {
  $defs: {
    data_shape: {
      produces: {
        additionalProperties: false,
        properties: {
          format: {
            default: 'application/octet-stream',
            enum: ['application/octet-stream'],
            type: 'string',
          },
        },
        required: ['format'],
        type: 'object',
      },
    },
  },
  additionalProperties: false,
  properties: {
    data_shape: {
      additionalProperties: false,
      properties: {
        produces: {
          $ref: '#/$defs/data_shape/produces',
        },
      },
      type: 'object',
    },
  },
  type: 'object',
};

const testSchema2 = {
  $defs: {
    data_shape: {
      consumes: {
        additionalProperties: false,
        properties: {
          format: {
            default: 'application/octet-stream',
            enum: ['application/octet-stream'],
            type: 'string',
          },
        },
        required: ['format'],
        type: 'object',
      },
    },
  },
  additionalProperties: false,
  properties: {
    data_shape: {
      additionalProperties: false,
      properties: {
        consumes: {
          $ref: '#/$defs/data_shape/consumes',
        },
      },
      type: 'object',
    },
  },
  type: 'object',
};

describe('@cos-ui/utils/shared', () => {
  describe('clearEmptyObjectValues', () => {
    it('Should remove empty objects at the root and replace them with empty strings', () => {
      expect(clearEmptyObjectValues(testObj1)).toEqual(
        expect.objectContaining({
          aws_access_key: '',
          aws_bucket_name_or_arn: 's',
          aws_delete_after_read: false,
          aws_ignore_body: true,
          aws_region: 's',
          aws_secret_key: '',
          data_shape: {
            produces: {
              format: 'application/octet-stream',
            },
          },
          error_handler: {
            stop: {},
          },
          kafka_topic: 's',
        })
      );
    });
  });
});

describe('createDefaultFromSchema', () => {
  it('Should create default objects from a schema', () => {
    expect(createDefaultFromSchema('data_shape', testSchema1)).toEqual(
      expect.objectContaining({
        produces: {
          format: 'application/octet-stream',
        },
      })
    );
    expect(createDefaultFromSchema('data_shape', testSchema2)).toEqual(
      expect.objectContaining({
        consumes: {
          format: 'application/octet-stream',
        },
      })
    );
  });
});

describe('resolveReference', () => {
  it('Should resolve a reference in a schema to an object', () => {
    expect(
      resolveReference('#/$defs/data_shape/produces', testSchema1)
    ).toEqual({
      additionalProperties: false,
      properties: {
        format: {
          default: 'application/octet-stream',
          enum: ['application/octet-stream'],
          type: 'string',
        },
      },
      required: ['format'],
      type: 'object',
    });
    expect(
      resolveReference('#/$defs/data_shape/consumes', testSchema2)
    ).toEqual(
      expect.objectContaining({
        additionalProperties: false,
        properties: {
          format: {
            default: 'application/octet-stream',
            enum: ['application/octet-stream'],
            type: 'string',
          },
        },
        required: ['format'],
        type: 'object',
      })
    );
  });
});
