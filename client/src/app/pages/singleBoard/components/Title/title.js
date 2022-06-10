import React, { useState } from "react";
import { MoreVert } from "@material-ui/icons";
import ClickOutHandler from "react-onclickout";

import "./styles.scss";
import { useDispatch, useSelector } from "react-redux";
import { removeList, updateListTitle } from "../../../../store/boardActions";

const Title = ({ title, listId }) => {
	const [open, setOpen] = useState(false);
	const [openOptions, setOpenOptions] = useState(false);
	const [newTitle, setNewTitle] = useState(title);
	const dispatch = useDispatch();
	const currentBoard = useSelector(state => state.currentBoard.currentBoard);

	const handleOnBlur = () => {
		if (newTitle && newTitle !== title) {
			dispatch(updateListTitle(newTitle, listId, currentBoard._id));
		}
		setOpen(!open);
	};

	return (
		<React.Fragment>
			{open ? (
				<div>
					<input
						type="text"
						className="input-title"
						value={newTitle}
						maxLength={20}
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
				<div className="editable-title-container">
					<h2 onClick={() => setOpen(!open)} className="editable-title">
						{title}
					</h2>
					<button
						className="list-button"
						onClick={() => setOpenOptions(!openOptions)}
					>
						<MoreVert />
					</button>
					{openOptions && (
						<ClickOutHandler
							onClickOut={() => {
								setOpenOptions(!openOptions);
							}}
						>
							<ul className="menu-card">
								<li
									onClick={() => {
										setOpenOptions(!openOptions);
										dispatch(removeList(listId, currentBoard._id));
									}}
								>
                  Delete list
								</li>
								<li
									onClick={() => {
										setOpenOptions(!openOptions);
										setOpen(!open);
									}}
								>
                  Edit list title
								</li>
							</ul>
						</ClickOutHandler>
					)}
				</div>
			)}
		</React.Fragment>
	);
};


export default Title;