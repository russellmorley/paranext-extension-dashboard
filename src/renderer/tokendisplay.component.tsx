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
    borderWidth: isHover? 'thin' : '0',
    cursor: 'pointer',
  };

  return (
    <>
      <span
        className={'token'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-loc={token.tokenId.toString()}
        title={`tokenId: ${token.tokenId.toString()}; trainingText: ${token.trainingText}; surfaceText: ${token.surfaceText}`}>
          <span>{token.paddingBefore}{token.surfaceTextPrefix}</span>
          <span style={tokenStyle}>{token.surfaceText}  </span>
          <span>{token.surfaceTextSuffix}{token.paddingAfter}</span>
      </span>
    </>
  );
}
