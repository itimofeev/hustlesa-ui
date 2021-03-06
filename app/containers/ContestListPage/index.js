/*
 *
 * ContestListPage
 *
 */


import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Helmet from 'react-helmet';

import messages from './messages';
import { keywords, avatarTextFrom } from '../../utils/util';
import { createStructuredSelector } from 'reselect';
import { Tabs, Tab } from 'material-ui/Tabs';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import styles from './styles.css';

import {
  selectContestList,
  selectLoading,
  selectError,
} from '../../containers/App/selectors';

import {
  selectSelectedContest,
  selectSmallWidth,
  selectVisibleContestMap,
} from './selectors';

import { loadContestList } from '../App/actions';
import { contestSelected, changeSmallWidth } from './actions';
import MarkdownElement from 'react-material-markdown-element';
import { FormattedMessage } from 'react-intl';

export class ContestListPage extends React.Component {
  state = {
    open: false,
    dialogContent: false,
  };

  handleOpen = (dialogContent) => {
    this.setState({ open: true, dialogContent: dialogContent });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  /**
   * when initial state username is not null, submit the form to load repos
   */
  componentDidMount() {
    if (!this.props.contestList) {
      this.props.onSubmitForm();
    }

    const that = this;

    this.resizeListener = function () {
      if (!that.props.smallWidth && window.innerWidth < 600) {
        that.props.changeSmallWidth(true);
      } else if (that.props.smallWidth && window.innerWidth > 600) {
        that.props.changeSmallWidth(false);
      }
    };

    window.addEventListener('resize', this.resizeListener);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }

  onExpand = (itemId) => {
    if (this.props.selectedContest === itemId) {
      this.props.onContestSelect(false);
    } else {
      this.props.onContestSelect(itemId);
    }
  };


  render() {
    const contestList = this.props.visibleContestMap;
    const selectedContestId = this.props.selectedContest;
    let listRender;
    let loadingRender;
    let errorRender;

    let yearList = Object.keys(contestList).sort((a, b) => a < b);

    if (contestList) {
      listRender = (
        <Tabs>
          {yearList.map((e) => {
            return <Tab key={e} label={e}>
              <div className={styles.ContestList}>
                {contestList[e].map((item) => {

                  const isSelected = selectedContestId === item.id;

                  return (
                    <Paper
                      key={item.id}
                      className={isSelected ? styles.ContestItem_expanded : styles.ContestItem}
                    >
                      <div className={styles.ContestItem_content} onClick={() => this.onExpand(item.id)}>
                        <div className={styles.ContestItem_image}>
                          {item.avatar_file && <Avatar size={60} src={`/images/contests/${item.avatar_file}`}/>}
                          {!item.avatar_file && <Avatar size={60}>{avatarTextFrom(item.title)}</Avatar>}
                        </div>
                        <div className={styles.ContestItem_info}>
                          <div className={styles.ContestItem_title}>
                            {item.title}
                          </div>
                          <div className={styles.ContestItem_city}>
                            {item.city_name}
                          </div>
                        </div>
                        <div className={styles.ContestItem_date}>
                          {item.date_str}
                        </div>
                      </div>

                      <div className={styles.ContestItem_actions}>
                        <FlatButton label="Форум" href={item.forum_url} target="_blank" />

                        {item.vk_link &&
                        <IconButton href={item.vk_link} target="_blank">
                          <div className={styles.ContestItem_Action_icon}>
                            <i className="zmdi zmdi-vk" />
                          </div>
                        </IconButton>
                        }

                        {item.results_link && item.results_link.length > 0 &&
                        <IconButton onClick={() => this.handleOpen(item.results_link)}>
                          <div className={styles.ContestItem_Action_icon2}>
                            <i className="fa fa-trophy" />
                          </div>
                        </IconButton>
                        }

                        {item.videos_link && item.videos_link.length > 1 &&
                        <IconButton onClick={() => this.handleOpen(item.videos_link)}>
                          <div className={styles.ContestItem_Action_icon2}>
                            <i className="zmdi zmdi-youtube-play" />
                          </div>
                        </IconButton>
                        }

                        {item.videos_link && item.videos_link.length === 1 &&
                        <IconButton href={item.videos_link[0].link} target="_blank">
                          <div className={styles.ContestItem_Action_icon}>
                            <i className="zmdi zmdi-youtube-play" />
                          </div>
                        </IconButton>
                        }


                        {item.photos_link && item.photos_link.length > 1 &&
                        <IconButton onClick={() => this.handleOpen(item.photos_link)}>
                          <div className={styles.ContestItem_Action_icon2}>
                            <i className="zmdi zmdi-camera" />
                          </div>
                        </IconButton>
                        }


                        {item.photos_link && item.photos_link.length === 1 &&
                        <IconButton href={item.photos_link[0].link} target="_blank">
                          <div className={styles.ContestItem_Action_icon}>
                            <i className="zmdi zmdi-camera" />
                          </div>
                        </IconButton>
                        }
                      </div>

                      <Divider />

                      <div className={`${styles.ContestItemCollapsible} ${isSelected ? styles.opened : ''}`}>
                        <MarkdownElement text={item.common_info} style={{ padding: 0 }} />
                      </div>
                    </Paper>
                  );
                })}
              </div>
            </Tab>
          })
          }
        </Tabs>
      );
    }

    if (this.props.loading) {
      loadingRender = (
        <CircularProgress size={80} thickness={5} />
      );
    }

    if (this.props.error) {
      errorRender = <FormattedMessage {...messages.errorLoadingContestList} />;
    }

    let dialogRender = (
      <Dialog
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
      >
        <List>
          {this.state.dialogContent && this.state.dialogContent.map((r) => {
            return <ListItem key={r.text} primaryText={r.text} href={r.link} target="_blank">
            </ListItem>
          })}
        </List>
      </Dialog>
    );

    return (
      <article>
        <Helmet
          title="Турниры"
          meta={[
            { name: 'description', content: 'VHustle — портал с информацией о конкурсах по хастлу' },
            { name: 'keywords', content: keywords },
          ]}
        />

        <div className={styles.Contests_container}>
          {listRender}
          {errorRender}
          {loadingRender}
          {dialogRender}
        </div>
      </article>
    );
  }
}

ContestListPage.propTypes = {
  changeRoute: React.PropTypes.func,
  loading: React.PropTypes.bool,
  error: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  contestList: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.bool,
  ]),
  visibleContestMap: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  selectedContest: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.bool,
  ]),
  onSubmitForm: React.PropTypes.func,
  changeSmallWidth: React.PropTypes.func,
  onContestSelect: React.PropTypes.func,
  smallWidth: React.PropTypes.bool,
};

function mapDispatchToProps(dispatch) {
  return {
    changeRoute: (url) => dispatch(push(url)),
    changeSmallWidth: (smallWidth) => dispatch(changeSmallWidth(smallWidth)),
    onContestSelect: (comp) => dispatch(contestSelected(comp)),
    onSubmitForm: (evt) => {
      if (evt !== undefined && evt.preventDefault) {
        evt.preventDefault();
      }
      dispatch(loadContestList());
    },
    dispatch,
  };
}

const mapStateToProps = createStructuredSelector({
  contestList: selectContestList(),
  visibleContestMap: selectVisibleContestMap(),
  smallWidth: selectSmallWidth(),
  selectedContest: selectSelectedContest(),
  loading: selectLoading(),
  error: selectError(),
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ContestListPage);
