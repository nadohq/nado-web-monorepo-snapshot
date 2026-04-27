/*
This is a base type for all components that need to be tested.
It includes a `dataTestId` prop that can be used to identify the component in tests.
*/
export interface BaseTestProps {
  dataTestId?: string;
}
