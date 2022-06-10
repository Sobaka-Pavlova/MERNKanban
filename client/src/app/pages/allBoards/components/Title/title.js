import React, { useState } from "react";
import { MoreVert } from "@material-ui/icons";
import ClickOutHandler from "react-onclickout";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { currentBoardSliceActions } from "../../../../store/currentBoardSlice";
import { updateBoardTitle, deleteBoard } from "../../../../store/boardActions";

import "./styles.scss";

export default function Title({ title, boardId }) {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [open, setOpen] = useState(false);
	const [openOptions, setOpenOptions] = useState(false);
	const [newTitle, setNewTitle] = useState(title);


	const boards = useSelector(state => state.user.allBoards);
	const currentBoard = boards.filter(el => el._id === boardId)[0];

	const handleOnBlur = () => {
		if (newTitle && newTitle !== title) {
			dispatch(updateBoardTitle(newTitle, boardId));
		}
		setOpen(!open);
	};

	const handleBoardClick = () => {
		dispatch(currentBoardSliceActions.setBoard(currentBoard));
		navigate(`/user/boards/${title}`);
	};

	return (
		<>
			{open ? (
				<div>
					<input
						type="text"
						className="board-input-title"
						value={newTitle}
						onChange={(e) => {
							setNewTitle(e.target.value);
						}}
						onBlur={handleOnBlur}
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								handleOnBlur();
							}
							return;
						}}
						autoFocus
					/>
				</div>
			) : (
				<div onClick={handleBoardClick} className="board-editable-title-container">
					<h2 className="board-editable-title">
						{title}
					</h2>
					<button
						className="board-list-button"
						onClick={(e) => { e.stopPropagation(); setOpenOptions(!openOptions); }}
					>
						<MoreVert />
					</button>
					{openOptions && (
						<ClickOutHandler
							onClickOut={() => {
								setOpenOptions(!openOptions);
							}}
						>
							<ul className="board-menu-card">
								<li
									onClick={(e) => {
										e.stopPropagation();
										setOpenOptions(!openOptions);
										dispatch(deleteBoard(boardId));
									}}
								>
                  Delete Board
								</li>
								<li
									onClick={(e) => {
										e.stopPropagation();
										setOpenOptions(!openOptions);
										setOpen(!open);
									}}
								>
                  Edit Board title
								</li>
							</ul>
						</ClickOutHandler>
					)}
				</div>
			)}
		</>
	);
}
