import styled from "styled-components";
export const TextInput = styled.input`
  width: ${(props) => props.width * (2/3)}px;
  font-size: 20px;
  ::placeholder {
    color: gray;
  }
  text-align: center;
`;

export const InputContainer = styled.div`
  position: absolute;
  left: ${(props) => props.width * (1/6)}px;
  top: 40px;
  gap: 5px;
  z-index: 10;
  height: 40px;
  display: flex;
  flex-direction: column;
  width: 100%,
  justify-content: center;
  align-items: center;
`