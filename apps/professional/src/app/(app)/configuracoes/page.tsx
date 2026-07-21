import { redirect } from 'next/navigation';

/** Configurações antigas → Meu link (print atual). */
export default function ConfiguracoesRedirectPage() {
  redirect('/meu-link');
}
