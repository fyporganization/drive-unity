export async function hello(name: string): Promise<string> {
  return `Hello, ${name}! Worker is alive at ${new Date().toISOString()}`;
}
