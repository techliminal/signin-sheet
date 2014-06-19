	/** @jsx React.DOM */
	var emailValidator = /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i;
	
	function todaysKey() {
		var now = new Date();
		return 'signin-data-'+[now.getFullYear(),
													 ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()],
													 now.getDate()].join(".");
	}
	
	var SigninForm = React.createClass({
		getInitialState: function() {
			return { nameValue: "", emailValue: "", mailinglistValue: false, submitting: false };
		},

		postToMailchimp: function(cb) {
			var mcURL = "http://techliminal.us2.list-manage.com/subscribe/post?u=9cfb95a838ce41c6f0fdcdb50&id=1bb1c53ed3";
			$.ajax({
				url: mcURL,
				type:'POST',
				data: {
					EMAIL: this.state.emailValue
				}
			}).always(cb);
		},
		
		updateForm: function(cb) {
			$.ajax({
				url: 'https://docs.google.com/forms/d/1Qis5HBQWdByhgU5S_kDzDRyUvnFLXTbzAeu0tJPWZfI/formResponse',
				method: "POST",
				data: {
					'entry.304838327': this.state.nameValue,
					'entry.1508544992': this.state.emailValue,
					'entry.2058622032': this.state.mailinglistValue ? 'Yes' : undefined
				}
			}).always(cb);
		},

		saveData: function(data) {
			var key = todaysKey();
			var dataList = JSON.parse(localStorage.getItem(key) || '[]');
			var now = new Date();
			dataList.push({
				day: [now.getMonth()+1, now.getDate(), now.getFullYear()].join('/'),
				time: [now.getHours(), ("0"+now.getMinutes()).substr(-2,2), ("0"+now.getSeconds()).substr(-2, 2)].join(':'),
				name: data.nameValue,
				email: data.emailValue,
				newsletter: data.mailinglistVale
			});
			localStorage.setItem(key, JSON.stringify(dataList));
			this.setProps({list: dataList});
		},

		handleSignin: function(event) {
			var data = this.state;
			this.saveData(data);
			this.setState({submitting: true});
			var self = this;
			this.updateForm(function() {
				if (data.mailinglistValue) { 
					self.postToMailchimp(function() {
						self.setState(self.getInitialState());
						self.refs.name.getDOMNode().focus();
					});
				} else {
					self.setState(self.getInitialState());
					self.refs.name.getDOMNode().focus();              
				}
			});
			
			return false;
		},

		handleNameChange: function(event) {
			this.setState({ nameValue: event.target.value });
		},
		handleEmailChange: function(event) {
			this.setState({ emailValue: event.target.value });
		},
		handleCheckedChange: function(event) {
			this.setState({ mailinglistValue: event.target.checked });
		},
		
		render: function() {
			var validEmail = emailValidator.test(this.state.emailValue);
			var labelClass = validEmail ? "" : "disabled";
			var hasName = this.state.nameValue.length > 0;
			
			return <form onSubmit={this.handleSignin} onChange={this.onChange}>
				<h1>Welcome! Please Sign in:</h1>
				<p><label className="normal">Name: </label><input onChange={this.handleNameChange} type="text" ref="name" value={this.state.nameValue} disabled={this.state.submitting} /></p>
				<p><label className="normal">Email: </label><input onChange={this.handleEmailChange} type="email" value={this.state.emailValue} disabled={this.state.submitting} /></p>
				<p><label className={labelClass}><input type="checkbox" ref="mailinglist" disabled={this.state.submitting || ! validEmail} checked={this.state.mailinglistValue} onChange={this.handleCheckedChange} /> Yes, please sign me up for updates from Tech Liminal!</label></p>
				<p><input type="submit" value="Sign in!" disabled={this.state.submitting || ! hasName} /> {this.state.submitting ? <img src="/img/ajax-loader.gif" /> : ''}</p>
				
				<hr/>
				<h2>Who else was here today?</h2>
				<table>
					<thead>
						<tr><th>Date</th><th>Name</th><th>Email</th><th>Newsletter?</th></tr>
					</thead>
					<tbody>
						{this.props.list.map(function(item) {
							return <tr>
											 <td>{item.day}&nbsp;{item.time}</td>
											 <td>{item.name}</td>
											 <td>{item.email}</td>
											 <td>{item.mailinglist ? 'Yes' : 'No'}</td>
										 </tr>
						})}
					</tbody>
				</table>
			</form>;
		}
	})
	React.renderComponent(
		<SigninForm list={JSON.parse(localStorage.getItem(todaysKey()) || '[]')}/>,
		document.getElementById('form')
	);
