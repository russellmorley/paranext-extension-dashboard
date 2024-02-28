import { Token } from "./dashboard.verses.datacontext";

export function TokenDisplay({token}: {token: Token}) {

  return (
    <>
      <span className="token">{token.text}</span>
    </>
  );
}
