
import { TextInput, InputContainer} from "./styles";
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