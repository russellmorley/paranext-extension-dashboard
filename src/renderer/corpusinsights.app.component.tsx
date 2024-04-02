import { useContext} from "react";
import { DisplayFromTokensTextRowsComponent } from "./display.tokenstextrows.component";
import { CurrentVerseContext } from "./currentverse.context";
import { ChakraProvider } from '@chakra-ui/react'
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { CorpusInsightsTokensTextRowsDataContext } from "./corpusinsights.tokenstextrows.datacontext";

type Visualization = {
  header?: JSX.Element,
  body: JSX.Element,
  footer?: JSX.Element,
}

export function CorpusInsightsAppComponent() {
  const verseRef = useContext(CurrentVerseContext);

   return (
    <ChakraProvider>
      <Card>
      </ Card>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardBody>
          <Text fontSize='2xl'>
            <CorpusInsightsTokensTextRowsDataContext verseRef={verseRef}>
              <DisplayFromTokensTextRowsComponent />
            </CorpusInsightsTokensTextRowsDataContext>
          </Text>
        </CardBody>
        <CardFooter>
          <Text fontSize='sm'>
          (c) Biblica
          </Text>
        </CardFooter>
      </ Card>
    </ChakraProvider>
  );
}
