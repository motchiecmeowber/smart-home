import { z } from "zod";

const EmailSchema = z.email("Email không hợp lệ");

export type Identifier = 
    | { type: "email"; value: string }
    | { type: "username"; value: string };

export const parseIdentifier = (val: string): Identifier => {
    if (EmailSchema.safeParse(val).success) {
        return { type: "email", value: val };
    }
    return { type: "username", value: val };
}