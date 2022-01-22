import { Todo } from '@prisma/client'
import React from 'react'
import { useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import {
  ActionFunction,
  Form,
  LoaderFunction,
  useActionData,
  useLoaderData,
} from 'remix'
import ActionButton from '~/components/action-button'
import { db } from '~/utils/db.server'

type LoaderData = { todos: Array<Todo> }
export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    todos: await db.todo.findMany(),
  }
  return data
}

type ActionData = { createdTodo: Todo; deletedTodo: Todo }
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const { _action, payload, 'new-todo': newTodo } = Object.fromEntries(formData)
  const todoId = Number(payload)

  if (_action === 'complete') {
    await db.todo.update({
      where: {
        id: todoId,
      },
      data: {
        complete: true,
      },
    })
  } else if (_action === 'delete') {
    const deletedTodo = await db.todo.delete({ where: { id: todoId } })
    console.log(deletedTodo)
    return {
      deletedTodo,
    }
  } else if (_action === 'add' && typeof newTodo === 'string' && newTodo !== '') {
    const createdTodo = await db.todo.create({
      data: {
        name: newTodo,
        complete: false,
      },
    })
    return {
      createdTodo,
    }
  }
  return null
}

export default function Index() {
  const { todos } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const formRef = React.useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    if (actionData?.createdTodo?.name) {
      toast(`New Todo "${actionData.createdTodo.name}" added!`, { type: 'success' })
    }
    if (actionData?.deletedTodo?.name) {
      toast(`New Todo "${actionData.deletedTodo.name}" deleted!`, { type: 'success' })
    }
    formRef.current?.reset()
  }, [actionData?.createdTodo?.name, actionData?.deletedTodo?.name])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Todo List</h1>
      <ul>
        {todos.length === 0 ? (
          <h2>No todos!</h2>
        ) : (
          todos.map((t) => (
            <li key={t.id}>
              <span
                style={{
                  textDecoration: t.complete ? 'line-through' : undefined,
                }}
              >
                {t.name}
              </span>{' '}
              <ActionButton
                style={{ color: 'red' }}
                aria-label='delete'
                type='submit'
                name='_action'
                value='delete'
                payload={t.id}
              >
                x
              </ActionButton>
              <ActionButton
                style={{ color: 'green' }}
                aria-label='complete'
                type='submit'
                name='_action'
                value='complete'
                payload={t.id}
              >
                √
              </ActionButton>
            </li>
          ))
        )}
      </ul>
      <Form method='post' ref={formRef}>
        <label htmlFor='new-todo'>New Todo</label>
        <br />
        <input type='text' name='new-todo' id='new-todo' />{' '}
        <button type='submit' name='_action' value='add'>
          Add
        </button>
      </Form>
      <ToastContainer theme='dark' />
    </div>
  )
}
