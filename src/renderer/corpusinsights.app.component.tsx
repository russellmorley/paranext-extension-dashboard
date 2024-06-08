import { ChakraProvider, Card, CardHeader, CardBody, CardFooter, Text } from '@chakra-ui/react';
import { DisplayFromTokensTextRowsComponent } from './display.tokenstextrows.component';
import { CorpusInsightsTokensTextRowsDataContext } from './corpusinsights.tokenstextrows.datacontext';

// eslint-disable-next-line import/prefer-default-export
export function CorpusInsightsAppComponent() {
  /*
  const verseRef = useContext(CurrentVerseContext);

  Removed verseRef from this line below because verseRef was removed from the data context
              <CorpusInsightsTokensTextRowsDataContext verseRef={verseRef}>
  */
  return (
    <ChakraProvider>
      <Card />
      <Card>
        <CardHeader />
        <CardBody>
          <Text fontSize="2xl">
            <CorpusInsightsTokensTextRowsDataContext>
              <DisplayFromTokensTextRowsComponent />
            </CorpusInsightsTokensTextRowsDataContext>
          </Text>
        </CardBody>
        <CardFooter>
          <Text fontSize="sm">(c) Biblica</Text>
        </CardFooter>
      </Card>
    </ChakraProvider>
  );
}
