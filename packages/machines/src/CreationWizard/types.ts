import { ActorRefFrom } from 'xstate';
import { kafkasMachine } from './KafkasMachine';

export type KafkaMachineActorRef = ActorRefFrom<typeof kafkasMachine>;
