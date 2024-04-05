import {  useState } from "react";
import { TextInsight } from "src/shared/services/textinsights.service";
import { Card, CardBody, CardFooter, CardHeader, Text } from '@chakra-ui/react'

export type DisplayFromTextInsightProps = {
  textInsight: TextInsight;
}

export function DisplayFromTextInsight({textInsight}: DisplayFromTextInsightProps) {

  return (
      <>
        <Card colorScheme={"whiteAlpha"}>
          <CardBody>
            <Text fontSize={'md'} as='i'>{textInsight.description}</Text>
            {!textInsight.resultError ? (
              <Text fontSize={'md'} color={'blue'}>{textInsight.result}</Text>
            ):(
              <Text fontSize={'md'} color={'red'}>{textInsight.resultError}</Text>
            )}
          </CardBody>
          <CardFooter>
            <Text fontSize={'xs'} as='i'>From { textInsight.source} at {new Date(textInsight.created).toLocaleString()}</Text>
          </CardFooter>
          </Card>
      </>
    //   )}
    // </>
  )
}
