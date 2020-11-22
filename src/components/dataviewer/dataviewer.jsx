import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import Draggable from 'react-draggable';
import VM from 'scratch-vm';

import styles from './dataviewer.css';

import dataviewerIcon from '../../lib/libraries/extensions/dataviewer/dataviewer-small.svg';

import shrinkIcon from '../cards/icon--shrink.svg';
import expandIcon from '../cards/icon--expand.svg';
import closeIcon from '../cards/icon--close.svg';

const DataviewerHeader = ({onCloseChart, onShrinkExpandChart, expanded}) => (
    <div className={expanded ? styles.headerButtons : classNames(styles.headerButtons, styles.headerButtonsHidden)}>
        <div
            className={styles.dataviewerButton}
        >
            <img
                className={styles.dataviewerIcon}
                src={dataviewerIcon}
            />
            <FormattedMessage
                defaultMessage="Data Viewer"
                description="Name for the 'Data Viewer' extension"
                id="gui.extension.dataviewer.name"
            />
        </div>
        <div className={styles.headerButtonsRight}>
            <div
                className={styles.shrinkExpandButton}
                onClick={onShrinkExpandChart}
            >
                <img
                    draggable={false}
                    src={expanded ? shrinkIcon : expandIcon}
                />
                {expanded ?
                    <FormattedMessage
                        defaultMessage="Shrink"
                        description="Title for button to shrink how-to card"
                        id="gui.cards.shrink"
                    /> :
                    <FormattedMessage
                        defaultMessage="Expand"
                        description="Title for button to expand how-to card"
                        id="gui.cards.expand"
                    />
                }
            </div>
            <div
                className={styles.removeButton}
                onClick={onCloseChart}
            >
                <img
                    className={styles.closeIcon}
                    src={closeIcon}
                />
                <FormattedMessage
                    defaultMessage="Close"
                    description="Title for button to close how-to card"
                    id="gui.cards.close"
                />
            </div>
        </div>
    </div>
);

DataviewerHeader.propTypes = {
    onCloseChart: PropTypes.func.isRequired,
    onShrinkExpandChart: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired
};

const DataviewerChart = ({vm}) => {
    const stage = vm.runtime.getTargetForStage();
    const stageVariables = stage.getAllVariableNamesInScopeByType('list');

    return (
        <table className={styles.tablePreview}>
            <tr><th>List</th><th>Index</th><th>Value</th></tr>{
                stageVariables.map(variable => (
                    stage.lookupVariableByNameAndType(variable, 'list', false).value.slice().map((item, idx) => (
                        <tr key={idx}><td>{variable}</td><td>{idx}</td><td>{item}</td></tr>
                    ))
                ))
            }</table>
    );
};

DataviewerChart.propTypes = {
    vm: PropTypes.instanceOf(VM).isRequired
};

const Dataviewer = props => {
    const {
        expanded,
        vm,
        isRtl,
        onCloseChart,
        onShrinkExpandChart,
        onDrag,
        onStartDrag,
        onEndDrag,
        ...posProps
    } = props;
    let {x, y} = posProps;

    // Draggable windows need to calculate their own dragging bounds
    // to allow for dragging them  off the left, right and bottom
    // edges of the workspace.
    const windowHorizontalDragOffset = 400; // ~80% of window width
    const windowVerticalDragOffset = expanded ? 257 : 0; // ~80% of window height, if expanded
    const menuBarHeight = 48; // TODO: get pre-calculated from elsewhere?
    const wideWindowWidth = 500;

    if (x === 0 && y === 0) {
        // initialize positions
        x = isRtl ? (-190 - wideWindowWidth - windowHorizontalDragOffset) : 292;
        x += windowHorizontalDragOffset;
        // The window is about 320px high, and the default position is pinned
        // to near the bottom of the blocks palette to allow room to work above.
        const tallWindowHeight = 320;
        const bottomMargin = 60; // To avoid overlapping the backpack region
        y = window.innerHeight - tallWindowHeight - bottomMargin - menuBarHeight;
    }

    return (
        // Custom overlay to act as the bounding parent for the draggable, using values from above
        <div
            className={styles.chartContainerOverlay}
            style={{
                width: `${window.innerWidth + (2 * windowHorizontalDragOffset)}px`,
                height: `${window.innerHeight - menuBarHeight + windowVerticalDragOffset}px`,
                top: `${menuBarHeight}px`,
                left: `${-windowHorizontalDragOffset}px`
            }}
        >
            <Draggable
                bounds="parent"
                cancel="#video-div" // disable dragging on video div
                position={{x: x, y: y}}
                onDrag={onDrag}
                onStart={onStartDrag}
                onStop={onEndDrag}
            >
                <div className={styles.chartContainer}>
                    <div className={styles.chart}>
                        <DataviewerHeader
                            onCloseChart={onCloseChart}
                            onShrinkExpandChart={onShrinkExpandChart}
                            expanded={expanded}
                        />
                        <div className={expanded ? styles.chartBody : styles.hidden}>
                            <DataviewerChart vm={vm} />
                        </div>
                    </div>
                </div>
            </Draggable>
        </div>
    );
};

Dataviewer.propTypes = {
    expanded: PropTypes.bool.isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
    isRtl: PropTypes.bool.isRequired,
    onCloseChart: PropTypes.func.isRequired,
    onShrinkExpandChart: PropTypes.func.isRequired,
    onDrag: PropTypes.func,
    onStartDrag: PropTypes.func,
    onEndDrag: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export {
    Dataviewer as default
};
