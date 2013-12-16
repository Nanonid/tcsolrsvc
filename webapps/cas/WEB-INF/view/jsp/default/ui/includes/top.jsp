<%@ page import="java.util.*"%>
<%@ page session="true" %>
<%@ page pageEncoding="UTF-8" %>
<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
	<head>
	    <title>CAS &#8211; Central Authentication Service</title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		
            <style type="text/css" media="screen">@import 'css/cas.css'/**/;</style>
                
	    <script type="text/javascript" src="js/common_rosters.js"></script>
        <link rel="icon" type="image/png" href="images/wfIcon.png" />
	</head>
    
    <%
        String ua = request.getHeader( "User-Agent" );
        boolean isFirefox = ( ua != null && ua.indexOf( "Firefox/" ) != -1 );
        boolean isIE = ( ua != null && ua.indexOf( "MSIE" ) != -1 );
        response.setHeader( "Vary", "User-Agent" );
    %>

    <% if( isFirefox ){ %>
    <body id="background" class="mozilla">
    <% } else if( isIE ){ %>
    <body id="background" class="ie">
        <div id="mainpanel">
    <% } else { %>
    <body id="background" class="chrome">
    <% } %>
    
        <div class="container">
          <div class="hdr">
            <div class="left">
              <div class="logoLeft"></div>
            </div>
          </div>
        </div>

    <% if( isIE ){ %>
        </div>
    <% } %>
    
		<div id="content">
