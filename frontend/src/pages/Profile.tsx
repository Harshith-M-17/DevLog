import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setUser } from '../store/authSlice';
import { getProfile, updateProfile } from "../services/api";
import "./Profile.css";

export const Profile: React.FC = () => {
	const dispatch = useDispatch();
	const user = useSelector((state: RootState) => state.auth.user);
	const [name, setName] = useState<string>(user?.name || "");
	const [email, setEmail] = useState<string>(user?.email || "");
	const [team, setTeam] = useState<string>(user?.team || "");
	const [password, setPassword] = useState<string>("");
	const [editing, setEditing] = useState(false);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProfile()
			.then(res => {
				dispatch(setUser(res.data));
				setName(res.data.name || "");
				setEmail(res.data.email || "");
				setTeam(res.data.team || "");
			})
			.catch(() => setMessage("Failed to load profile"))
			.finally(() => setLoading(false));
	}, []);

	const handleEdit = () => setEditing(true);
	const handleCancel = () => {
		setEditing(false);
		setPassword("");
		setMessage("");
		setLoading(true);
		getProfile()
			.then(res => {
				dispatch(setUser(res.data));
				setName(res.data.name || "");
				setEmail(res.data.email || "");
				setTeam(res.data.team || "");
			})
			.catch(() => setMessage("Failed to load profile"))
			.finally(() => setLoading(false));
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
	// removed setLoading
		const updateData = { name: name || "", email: email || "", team: team || "" };
		try {
			const res = await updateProfile(updateData);
			dispatch(setUser(res.data));
			setMessage("Profile updated successfully");
			setEditing(false);
		} catch {
			setMessage("Failed to update profile");
		}
	};

	return (
		<div className="profile-card">
			<h2>Profile</h2>
			<div className="profile-info">
				<div><strong>Name:</strong> {loading ? (
					<span className="skeleton skeleton-text" style={{width: 120}} />
				) : editing ? (
					<input value={name} onChange={e => setName(e.target.value)} />
				) : name}</div>
				<div><strong>Email:</strong> {loading ? (
					<span className="skeleton skeleton-text" style={{width: 180}} />
				) : email}</div>
				{editing && (
					<div>
						<strong>New Password:</strong>
						<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password" />
					</div>
				)}
			</div>
			<div className="profile-actions">
				{editing ? (
					<>
						<button onClick={handleSave}>Save Changes</button>
						<button onClick={handleCancel}>Cancel</button>
					</>
				) : (
					<button onClick={handleEdit} disabled={loading}>Edit Profile</button>
				)}
			</div>
			{message && <div style={{marginTop: "1rem", color: "#388e3c"}}>{message}</div>}
		</div>
	);
};
