const FilterInputString = (input, type) => {

  if(input.trim().length <= 0) {
    return false;
  }

  if(type == "twitter"){
      const pattern = /^https?:\/\/twitter\.com\/(\w+)\/status(es)?\/(\d+)/;
      return (input.search(pattern) !== -1);
  }
  else if(type == "youtube") {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    var matches = input.match(p);
    if(matches){
        return true;
    }
    return false;
  }

  return true;

}

export default FilterInputString;
