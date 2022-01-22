import { Form } from 'remix'

type ActionButtonProps = JSX.IntrinsicElements['button'] & { payload: any }

const ActionButton = ({ payload, ...props }: ActionButtonProps) => {
  return (
    <Form method='post' style={{ display: 'inline' }}>
      <input type='hidden' name='payload' value={payload} />
      <button {...props} />
    </Form>
  )
}

export default ActionButton
