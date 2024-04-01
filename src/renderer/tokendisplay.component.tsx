import { useState } from "react";
import { Token } from "./tokenstextrows.context";



export function TokenDisplayComponent({token, isError = false}: {token: Token, isError?: boolean}) {
  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = () => {
     setIsHover(true);
  };
  const handleMouseLeave = () => {
     setIsHover(false);
  };

  const tokenStyle = {
    backgroundColor: isHover ? 'yellow' : 'rgba(0,0,0,0)',
    textDecoration: isError ? 'red wavy underline' : 'none',
  };

  return (
    <>
      <span
        className={'token'}
        style={tokenStyle}
        data-loc={token.tokenId.toString()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
          {token.paddingBefore}{token.surfaceTextPrefix}{token.surfaceText}{token.surfaceTextSuffix}{token.paddingAfter}
        </span>
    </>
  );
}
