import React from 'react';
import { useMutation } from 'urql';

type Props = {
  id: number;
  text: string;
  complete: boolean;
};

export const Todo = (props: Props) => {
  const [mutation, executeMutation] = useMutation(RemoveTodo);

  const handleToggle = () => executeMutation({ id: props.id });

  return (
    <li onClick={handleToggle}>
      <p className={`${props.complete ? 'strikethrough' : ''}`}>{props.text}</p>
      {mutation.fetching && <span>(updating)</span>}
    </li>
  );
};

const RemoveTodo = `
mutation($id: ID!) {
  toggleTodo(id: $id) {
    id
  }
}
`;
