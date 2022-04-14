import {
  createDefaultFromSchema,
  resolveReference,
} from '../src/app/components/JsonSchemaConfigurator/CustomJsonSchemaBridge';

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

describe('@cos-ui/components/CustomJsonSchemaBridge utilities', () => {
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
});
