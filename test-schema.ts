import { AcpSchema } from './src/lib/kbcSchemas.ts';
import { zodToJsonSchema } from 'zod-to-json-schema';

console.log(JSON.stringify(zodToJsonSchema(AcpSchema, "OutputSchema"), null, 2));
console.log(JSON.stringify(zodToJsonSchema(AcpSchema, { name: "OutputSchema", target: "openApi3" }), null, 2));
