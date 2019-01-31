import React, { FunctionComponent, Fragment, useState } from 'react';
import { CategoryModel } from './HostGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Button from 'reactstrap/lib/Button';

interface PrepareRoundProps {
  categories: CategoryModel[];
  setCategories: (categories: CategoryModel[]) => void;
}

export const PrepareRound: FunctionComponent<PrepareRoundProps> = props => {
  const [pickedCategories, setPickedCategories] = useState<CategoryModel[]>([]);

  const selectCategory = (category: CategoryModel) => {
    if (pickedCategories.length >= 3) {
      const spliceArray = [...pickedCategories];
      spliceArray.splice(0, pickedCategories.length - 2);
      setPickedCategories([...spliceArray, category]);
    } else {
      setPickedCategories([...pickedCategories, category]);
    }
  };

  const removeCategory = (category: CategoryModel) => {
    setPickedCategories(
      pickedCategories.filter(
        pickedCategory => pickedCategory._id !== category._id,
      ),
    );
  };

  return (
    <Fragment>
      <h3>Pick three categories</h3>
      <ListGroup>
        {props.categories.map((category, index) => {
          const selected = pickedCategories.find(
            pickedCategory => pickedCategory._id === category._id,
          );
          console.log(selected);
          return (
            <ListGroupItem
              active={selected ? true : false}
              key={index}
              action
              onClick={() =>
                selected ? removeCategory(category) : selectCategory(category)
              }
            >
              {category.category}
            </ListGroupItem>
          );
        })}
      </ListGroup>
      <Button
        disabled={pickedCategories.length !== 3}
        onClick={() => props.setCategories(pickedCategories)}
      >
        Done
      </Button>
      <p style={{ fontStyle: 'italic', fontSize: '.7em' }}>
        Chosen categories will decide the available questions for the round.
      </p>
    </Fragment>
  );
};
