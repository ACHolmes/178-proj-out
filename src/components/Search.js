import styled from "styled-components";

// styles
const TextInput = styled.input`
  width: ${(props) => props.width * (2/3)}px;
  font-size: 20px;
  ::placeholder {
    color: gray;
  }
`;

const InputContainer = styled.div`
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

const Search = (props) => {
  return (
    <InputContainer width={props.width} height={props.height}>
      <TextInput
        height={props.height}
        width={props.width}
        placeholder={"example 1"}
      />
      <TextInput
        height={props.height}
        width={props.width}
        placeholder={"example 2"}
      />
    </InputContainer>
  );
}

export default Search;