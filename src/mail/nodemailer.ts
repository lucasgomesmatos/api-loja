import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import AccessUserEmail from "./templates/access-user-email";

export const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "24664fab081ec4",
    pass: "a781847796141e",
  },
});

export async function sendMail() {
  const emailHtml = render(
    AccessUserEmail({
      name: "Ana Mesquita",
      url: "https://admin.profbiodicas.com.br/auth/sign-in-member",
    }),
  );

  const options = {
    from: "naoresponda@profbiodicas.com.br",
    to: "user@gmail.com",
    subject: "[PROFBIODICAS] Confirmação de cadastro",
    html: emailHtml,
  };

  await transport.sendMail(options);
}
