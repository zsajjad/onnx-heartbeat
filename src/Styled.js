import styled from '@emotion/styled'

export const Heading = styled.h1`
  color: white;
  text-align: center;
`;

export const Description = styled.p`
  color: white;
  text-align: center;
`;

export const ImagesRow = styled.div`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  max-width: 720px;
  display: flex;
`;

export const ImageContainer = styled.div`
  background-image: url('${(props) => props['data-background']}');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: black;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.075, 0.81, 0.165, 1);
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.15);
  margin: 8px;
  cursor: pointer;
  display: flex;

  &:hover {
    opacity: 1;
  }

  ${(props) => props['data-selected'] ? `
    opacity: 1;
    transform: scale(1.05);
    box-shadow: 3px 4px 8px rgba(0, 0, 0, 0.15);
    border: 1px solid white;
  ` : `
    opacity: 0.6;
  `}
`

export const ResultContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 72px;
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  overflow-x: auto;
`
export const ResultItem = styled.div`
  padding: 8px 16px;
  border-radius: 8px;
  margin: 8px;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  text-align: center;

  & p {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }
  & span {
    margin: 0;
    font-size: 12px;
  }
`


