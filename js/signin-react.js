	/** @jsx React.DOM */
	var emailValidator = /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i;
	
	function todaysKey() {
		var now = new Date();
		return 'signin-data-'+[now.getFullYear(),
													 ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()],
													 now.getDate()].join(".");
	}
	
	var SigninForm = React.createClass({displayName: 'SigninForm',
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
				newsletter: data.mailinglistValue
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
			
			return React.DOM.form( {onSubmit:this.handleSignin, onChange:this.onChange}, 
				React.DOM.h1(null, "Welcome! Please Sign in:"),
				React.DOM.p(null, React.DOM.label( {className:"normal"}, "Name: " ),React.DOM.input( {onChange:this.handleNameChange, type:"text", ref:"name", value:this.state.nameValue, disabled:this.state.submitting} )),
				React.DOM.p(null, React.DOM.label( {className:"normal"}, "Email: " ),React.DOM.input( {onChange:this.handleEmailChange, type:"text", value:this.state.emailValue, disabled:this.state.submitting} )),
				React.DOM.p(null, React.DOM.label( {className:labelClass}, React.DOM.input( {type:"checkbox", ref:"mailinglist", disabled:this.state.submitting || ! validEmail, checked:this.state.mailinglistValue, onChange:this.handleCheckedChange} ), " Yes, please sign me up for updates from Tech Liminal!")),
				React.DOM.p(null, React.DOM.input( {type:"submit", value:"Sign in!", disabled:this.state.submitting || ! hasName} ), " ", this.state.submitting ? React.DOM.img( {src:"/img/ajax-loader.gif"} ) : ''),
				
				React.DOM.hr(null),
				React.DOM.h2(null, "Who else was here today?"),
				React.DOM.table(null, 
					React.DOM.thead(null, 
						React.DOM.tr(null, React.DOM.th(null, "Date"),React.DOM.th(null, "Name"),React.DOM.th(null, "Email"),React.DOM.th(null, "Newsletter?"))
					),
					React.DOM.tbody(null, 
						this.props.list.map(function(item) {
							return React.DOM.tr(null, 
											 React.DOM.td(null, item.day," ",item.time),
											 React.DOM.td(null, item.name),
											 React.DOM.td(null, item.email),
											 React.DOM.td(null, item.mailinglist ? 'Yes' : 'No')
										 )
						})
					)
				)
			);
		}
	});
	
	React.renderComponent(
		SigninForm( {list:JSON.parse(localStorage.getItem(todaysKey()) || '[]')}),
		document.getElementById('form')
	);
