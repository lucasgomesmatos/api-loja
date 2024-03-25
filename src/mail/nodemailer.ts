import { environment } from "@/env/env";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import AccessUserEmail from "./templates/access-user-email";

export const transport = nodemailer.createTransport({
  host: environment.EMAIL_HOST,
  port: environment.EMAIL_PORT,
  auth: {
    user: environment.EMAIL_USER,
    pass: environment.EMAIL_PASSWORD,
  },
});

export async function sendMail(name?: string, email?: string, token?: string) {
  const emailHtml = render(
    AccessUserEmail({
      name,
      url: `${environment.FRONT_URL}/api/auth-token?token=${token}`,
    }),
  );

  const options = {
    from: "naoresponda@profbiodicas.com.br",
    to: email,
    subject: "[PROFBIO.DICAS] Baixe seus arquivos!",
    html: emailHtml,
  };

  await transport.sendMail(options);
}
