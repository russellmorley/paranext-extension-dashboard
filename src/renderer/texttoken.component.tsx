import { Token } from "./verses.context";


export function TextFromToken({token}: {token: Token}) {

  return (
    <>
      <span className="token">{token.text}</span>
    </>
  );
}
