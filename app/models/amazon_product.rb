require 'time'
require 'uri'
require 'openssl'
require 'base64'

class AmazonProduct < Product

  def search(query)
    key = ENV['AMAZON_ACCESS_KEY_ID']
    secret = ENV['AMAZON_SECRET_ACCESS_KEY']

    # The region you are interested in
    ENDPOINT = "webservices.amazon.com"
    REQUEST_URI = "/onca/xml"

    params = {
      "Service" => "AWSECommerceService",
      "Operation" => "ItemSearch",
      "AWSAccessKeyId" => key,
      "AssociateTag" => "wishcaster-20",
      "SearchIndex" => "All",
      "Keywords" => query,
      "ResponseGroup" => "Images,ItemAttributes,ItemIds,OfferListings,Offers"
    }

    # Set current timestamp if not set
    params["Timestamp"] = Time.now.gmtime.iso8601 if !params.key?("Timestamp")

    # Generate the canonical query
    canonical_query_string = params.sort.collect do |key, value|
      [URI.escape(key.to_s, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]")), URI.escape(value.to_s, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))].join('=')
    end.join('&')

    # Generate the string to be signed
    string_to_sign = "GET\n#{ENDPOINT}\n#{REQUEST_URI}\n#{canonical_query_string}"

    # Generate the signature required by the Product Advertising API
    signature = Base64.encode64(OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), AWS_SECRET_KEY, string_to_sign)).strip()

    # Generate the signed URL
    request_url = "http://#{ENDPOINT}#{REQUEST_URI}?#{canonical_query_string}&Signature=#{URI.escape(signature, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))}"

    logger.debug("Signed URL: \"#{request_url}\"")
    return "Signed URL: \"#{request_url}\""
  end

  def
    
  end


end
