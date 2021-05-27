import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import Draggable from 'react-draggable';

import {MultiGrid, CellMeasurer, CellMeasurerCache} from 'react-virtualized';

import VM from 'scratch-vm';

import styles from './dataviewer.css';

import dataviewerIcon from '../../lib/libraries/extensions/dataviewer/dataviewer-small.svg';

import shrinkIcon from '../cards/icon--shrink.svg';
import expandIcon from '../cards/icon--expand.svg';
import closeIcon from '../cards/icon--close.svg';

const messages = defineMessages({
    dataviewer: {
        defaultMessage: 'Data Viewer',
        description: 'Name for the Data Viewer extension',
        id: 'gui.extension.dataviewer.name'
    },
    index: {
        defaultMessage: 'index',
        description: 'Index property name',
        id: 'gui.extension.dataviewer.index'
    }
});

const DataviewerHeader = ({onCloseChart, onShrinkExpandChart, expanded}) => (
    <div className={expanded ? styles.headerButtons : classNames(styles.headerButtons, styles.headerButtonsHidden)}>
        <div
            className={styles.dataviewerButton}
        >
            <img
                className={styles.dataviewerIcon}
                src={dataviewerIcon}
            />
            <FormattedMessage {...messages.dataviewer} />
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

class DataviewerChart extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getListVariables',
            'getListById',
            'getMaxListsLength',
            'getCellValue',
            'cellRenderer'
        ]);

        this.state = {
        };

        this._cache = new CellMeasurerCache({
            defaultWidth: 100,
            defaultHeight: 20,
            fixedHeight: false,
            fixedWidth: true
        });
    }

    // Based on scratch3_dataviewer > getDataMenu
    getListVariables () {
        const stage = this.props.vm.runtime.getTargetForStage();
        const items = [];
        if (stage) {
            for (const varId in stage.variables) {
                const currVar = stage.variables[varId];
                if (currVar.type === 'list') {
                    if (currVar.value.length > 0) {
                        items.push(({text: currVar.name, value: currVar.id}));
                    }
                }
            }
            items.sort((a, b) => {
                const _a = a.text.toUpperCase();
                const _b = b.text.toUpperCase();
                return _a > _b ? 1 : -1;
            });
        }
        return items;
    }

    // Based on scratch3_dataviewer > _data
    getListById (varID) {
        const stage = this.props.vm.runtime.getTargetForStage();
        if (stage) {
            const variable = stage.lookupVariableById(varID);
            return variable;
        }
    }

    // Based on scratch3_dataviewer > _getMaxDataLengthReadAll
    getMaxListsLength () {
        let length = 0;
        const items = this.getListVariables();
        const datasets = items.map(item => this.getListById(item.value).value);
        if (datasets.length > 0) {
            length = datasets.reduce((a, b) => {
                const aLength = a ? a.length : 0;
                const bLength = b ? b.length : 0;
                return aLength > bLength ? a : b;
            }).length;
        }
        return length;
    }

    getCellValue (columnIndex, rowIndex) {
        let content = 'error';
        if (columnIndex === 0 && rowIndex === 0) {
            content = this.props.intl.formatMessage(messages.index);
        } else if (columnIndex > 0 && rowIndex === 0) {
            // Header
            const items = this.getListVariables();
            const listName = items[columnIndex - 1];
            if (typeof listName !== 'undefined') {
                content = listName.text;
            }
        } else if (columnIndex === 0 && rowIndex > 0) {
            content = rowIndex;
        } else {
            const variableIDName = this.getListVariables()[columnIndex - 1];
            if (typeof variableIDName !== 'undefined') {
                const variable = this.getListById(variableIDName.value);
                content = variable.value[rowIndex - 1];
            }
        }
        // content = `${columnIndex},${rowIndex}`;
        return content;
    }

    cellRenderer ({columnIndex, key, parent, rowIndex, style}) {
        const content = this.getCellValue(columnIndex, rowIndex, style);
        return (
            <CellMeasurer
                cache={this._cache}
                columnIndex={columnIndex}
                key={key}
                parent={parent}
                rowIndex={rowIndex}
            >
                <div
                    className={styles.gridCell}
                    style={{
                        ...style,
                        width: '100'
                    }}
                >
                    {content}
                </div>
            </CellMeasurer>
        );
    }

    render () {
        const columnCount = this.getListVariables().length + 1;
        const rowCount = this.getMaxListsLength() + 1;

        const style = {
            border: '1px solid lightgray',
            margin: '1rem 1rem 1rem 1rem'
        };

        return (
            <MultiGrid
                {...this.state}
                fixedColumnCount={1}
                fixedRowCount={1}
                className={styles.grid}
                cellRenderer={this.cellRenderer}

                columnCount={columnCount}
                rowCount={rowCount}

                height={224}
                width={434}

                rowHeight={this._cache.rowHeight}

                columnWidth={100}
                deferredMeasurementCache={this._cache}

                overscanColumnCount={2}
                overscanRowCount={10}

                enableFixedColumnScroll
                enableFixedRowScroll
                hideTopRightGridScrollbar
                hideBottomLeftGridScrollbar

                style={style}

                classNameBottomLeftGrid={styles.gridBottomLeft}
                classNameBottomRightGrid={styles.gridBottomRight}
                classNameTopLeftGrid={styles.gridTopLeft}
                classNameTopRightGrid={styles.gridTopRight}
            />
        );
    }
}

DataviewerChart.propTypes = {
    vm: PropTypes.instanceOf(VM).isRequired,
    intl: intlShape.isRequired
};

const Dataviewer = props => {
    const {
        expanded,
        vm,
        intl,
        isRtl,
        onCloseChart,
        onShrinkExpandChart,
        onDrag,
        onStartDrag,
        onEndDrag,
        ...posProps
    } = props;
    let {x, y} = posProps;

    const onCloseChartTimeline = () => {
        vm.emit('closeDataviewerTable*');
        onCloseChart();
    };

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
                            // eslint-disable-next-line react/jsx-no-bind
                            onCloseChart={onCloseChartTimeline}
                            onShrinkExpandChart={onShrinkExpandChart}
                            expanded={expanded}
                        />
                        <div className={expanded ? styles.chartBody : styles.hidden}>
                            <DataviewerChart
                                vm={vm}
                                intl={intl}
                            />
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
    vm: PropTypes.instanceOf(VM).isRequired,
    intl: intlShape.isRequired
};

export default injectIntl(Dataviewer);
