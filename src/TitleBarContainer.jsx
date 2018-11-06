import React, { Component } from 'react';
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { addArticle } from './js/actions/actions.js';

class TitleBarContainer extends Component {
    constructor (props) {
      super(props);
      this.add = this.add.bind(this);
    }

    add() {
        const { dispatch } = this.props;
        dispatch(addArticle({ name: 'React Redux Tutorial for Beginners', id: 1 }));
        
    }

    render () {
        return (<div>TitleBarContainer {this.props.articles.length} <Button onClick={this.add}>+</Button></div>);
    }
};

const mapStateToProps = state => {
    return { articles: state.articles };
};

export default connect(mapStateToProps)(TitleBarContainer);