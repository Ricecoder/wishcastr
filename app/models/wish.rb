class Wish < ActiveRecord::Base
  has_many :products_wish
  has_many :products, through: :products_wish
  belongs_to :user

end