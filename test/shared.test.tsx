import { clearEmptyObjectValues } from '../src/utils/shared';

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
