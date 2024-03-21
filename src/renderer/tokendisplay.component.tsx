import { Token } from "./verses.context";



export function TokenDisplayComponent({token}: {token: Token}) {

  return (
    <>
      <span className="token">{token.surfaceTextPrefix}{token.surfaceText}{token.surfaceTextSuffix}</span>
    </>
  );
}
