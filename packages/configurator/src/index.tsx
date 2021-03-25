import * as React from 'react';
import { useMachine } from '@xstate/react';
import { configuratorMachine } from '@kas-connectors/machines';

export interface SlugProps {
  message: string;
}

export function Slug({message}: SlugProps) {
  const [state] = useMachine(configuratorMachine, { devTools: true });

  return <>
    <p>{state.value} - {message}</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eum, exercitationem modi itaque quis laborum consequuntur sapiente? Possimus, ipsum perferendis? Rerum voluptate saepe quas eligendi iure! Obcaecati cupiditate ea aliquam.</p>
  </>;
}

