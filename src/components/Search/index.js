
import { TextInput, InputContainer} from "./styles";
const Search = (props) => {
  return (
    <InputContainer width={props.width} height={props.height}>
      <TextInput
        height={props.height}
        width={props.width}
        placeholder={"To"}
      />
      <TextInput
        height={props.height}
        width={props.width}
        placeholder={"From"}
      />
    </InputContainer>
  );
}

export default Search;