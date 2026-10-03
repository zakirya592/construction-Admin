import { Alert, Button, Spinner } from "@heroui/react";
import { errorMessage } from "@/lib/format";
export function LoadingBlock() {
    return (<div className="grid min-h-64 place-items-center text-stone-500">
      <div className="flex items-center gap-3 text-sm">
        <Spinner />
        Pulling the latest from the site office
      </div>
    </div>);
}
export function ErrorBlock({ error, onRetry }) {
    return (<Alert status="danger">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>The desk did not load</Alert.Title>
        <Alert.Description>{errorMessage(error)}</Alert.Description>
      </Alert.Content>
      <Button variant="outline" size="sm" onPress={onRetry}>
        Try again
      </Button>
    </Alert>);
}
export function PageHeader({ kicker, title, description, action, }) {
    return (<div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-medium tracking-[0.2em] text-amber-800/80 uppercase">{kicker}</p>
        <h1 className="font-serif mt-1 text-4xl leading-none text-ink">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">{description}</p>
      </div>
      {action}
    </div>);
}
