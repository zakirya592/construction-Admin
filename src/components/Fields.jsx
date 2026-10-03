import { Button, Input, Label, ListBox, Modal, Select, TextArea, TextField } from "@heroui/react";
export function SearchBox({ value, onChange, placeholder, }) {
    return (<TextField value={value} onChange={onChange} aria-label={placeholder} className="w-full max-w-sm">
      <Input placeholder={placeholder}/>
    </TextField>);
}
export function TextControl({ label, value, onChange, type = "text", placeholder, }) {
    return (<TextField value={value} onChange={onChange} className="w-full">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder}/>
    </TextField>);
}
export function AreaControl({ label, value, onChange, placeholder, }) {
    return (<TextField value={value} onChange={onChange} className="w-full sm:col-span-2">
      <Label>{label}</Label>
      <TextArea placeholder={placeholder} rows={4}/>
    </TextField>);
}
export function SelectControl({ label, value, onChange, options, placeholder = "Select", }) {
    return (<Select className="w-full" placeholder={placeholder} selectedKey={value || null} onSelectionChange={(key) => {
            if (key != null)
                onChange(String(key));
        }}>
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (<ListBox.Item key={option.id} id={option.id} textValue={option.label}>
              {option.label}
            </ListBox.Item>))}
        </ListBox>
      </Select.Popover>
    </Select>);
}
export function FormDialog({ title, open, onOpenChange, onSubmit, pending, children, }) {
    return (<Modal isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-[min(680px,calc(100vw-2rem))]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="font-serif text-2xl">{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="grid gap-4 sm:grid-cols-2">{children}</div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="ghost">
                Cancel
              </Button>
              <Button variant="primary" onPress={onSubmit} isPending={pending}>
                Save
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>);
}
export function ConfirmDialog({ title, body, open, onOpenChange, onConfirm, pending, }) {
    return (<Modal isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="font-serif text-2xl">{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-stone-600">{body}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="ghost">
                Keep it
              </Button>
              <Button variant="danger" onPress={onConfirm} isPending={pending}>
                Remove
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>);
}
