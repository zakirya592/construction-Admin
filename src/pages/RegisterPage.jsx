import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button, Card, Input, InputGroup, Label, TextField } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useOffice } from "@/office";

export function RegisterPage() {
  const { user, register } = useOffice();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await register(name, email, password);
      toast.success(result.message || "Account created");
      navigate(result.signedIn ? "/" : "/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout>
      <Card className="border border-line bg-white shadow-none">
        <Card.Header>
          <Card.Title className="font-serif text-3xl">Create an account</Card.Title>
          <Card.Description>Name, email, and a password for the office.</Card.Description>
        </Card.Header>
        <Card.Content>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <TextField value={name} onChange={setName} isRequired>
              <Label>Name</Label>
              <Input autoComplete="name" />
            </TextField>
            <TextField value={email} onChange={setEmail} isRequired>
              <Label>Email</Label>
              <Input type="email" autoComplete="email" />
            </TextField>
            <TextField value={password} onChange={setPassword} isRequired minLength={8}>
              <Label>Password</Label>
              <InputGroup>
                <InputGroup.Input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} />
                <InputGroup.Suffix className="px-1">
                  <Button isIconOnly aria-label={showPassword ? "Hide password" : "Show password"} variant="ghost" size="sm" type="button" onPress={() => setShowPassword((visible) => !visible)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
            </TextField>
            <Button type="submit" variant="primary" isPending={pending}>
              Create account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-amber-800 hover:underline">
              Sign in
            </Link>
          </p>
        </Card.Content>
      </Card>
    </AuthLayout>
  );
}
