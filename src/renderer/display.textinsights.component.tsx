import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Spinner, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { TextInsight } from "src/shared/services/textinsights.service";
import { DisplayFromTextInsightProps, DisplayFromTextInsight } from "./display.textinsight.component";

export type DisplayFromTextInsightsProps = {
  textInsights: TextInsight[];
  isOpen: boolean;
  allTextInsightsIncluded: boolean;
  onClose: () => void;
}

export function DisplayFromTextInsights({textInsights, isOpen, onClose, allTextInsightsIncluded}: DisplayFromTextInsightsProps) {

  const onCloseCustom = () => {
    onClose();
    // setIsLoading(false);
    // setTextInsights({} as TextInsights);
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onCloseCustom}
      // finalFocusRef={btnRef}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          {textInsights.length === 0 ? (
            <Spinner></Spinner>
          ) : (
            <>
              {textInsights[0]?.tokenInfos
                ?.map(tokenInfo => tokenInfo.text)
                ?.reduce((accumulator, current) => `${accumulator}${current}`)}
            </>
          )}
        </DrawerHeader>
        <DrawerBody>
          <>
            {textInsights.map(textInsight =>
              <ul key={textInsight.type}>
                <DisplayFromTextInsight textInsight={textInsight}></DisplayFromTextInsight>
              </ul>)}
            {!allTextInsightsIncluded ? (<Spinner></Spinner>) : (<></>)}
          </>
        </DrawerBody>
        <DrawerFooter>
          <Button variant='outline' mr={3} onClick={onCloseCustom}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
